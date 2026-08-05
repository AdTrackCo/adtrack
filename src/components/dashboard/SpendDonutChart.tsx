import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { platformSpend } from '@/lib/mockData'
import { formatCurrency } from '@/lib/utils'

const total = platformSpend.reduce((sum, p) => sum + p.value, 0)

export function SpendDonutChart() {
  return (
    <div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={platformSpend} dataKey="value" nameKey="name" innerRadius={62} outerRadius={85} paddingAngle={3} stroke="none">
              {platformSpend.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#18181F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 12 }}
              formatter={(v) => formatCurrency(Number(v))}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="mono text-lg font-medium">{formatCurrency(total)}</span>
          <span className="text-[10px] text-[var(--color-text-secondary)]">Total Spend</span>
        </div>
      </div>
      <div className="space-y-2 mt-2">
        {platformSpend.map((p) => (
          <div key={p.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-[var(--color-text-secondary)]">
              <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
              {p.name}
            </span>
            <span className="mono text-[var(--color-text-primary)]">{((p.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
