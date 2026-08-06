import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input, Label } from '@/components/ui/Input'
import { Progress } from '@/components/ui/Progress'
import { SampleDataBanner } from '@/components/common/SampleDataBanner'
import { formatCurrency } from '@/lib/utils'

const budgetByCampaign = [
  { name: 'Summer Launch', planned: 20000, actual: 22800 },
  { name: 'Evergreen', planned: 15000, actual: 13400 },
  { name: 'Retargeting', planned: 8000, actual: 8600 },
  { name: 'BFCM Prep', planned: 12000, actual: 9100 },
]

const costMetrics = [
  ['CPM', '$14.20'],
  ['CPC', '$0.86'],
  ['CPA', '$24.60'],
  ['CPL', '$11.30'],
  ['ROAS', '3.42x'],
  ['ROI', '242%'],
]

export function Budget() {
  const [cogs, setCogs] = useState('')
  const [refundRate, setRefundRate] = useState('')
  const revenue = 330000
  const spend = 97300
  const margin =
    cogs && refundRate
      ? (((revenue * (1 - Number(refundRate) / 100) - Number(cogs) - spend) / revenue) * 100).toFixed(1)
      : null

  return (
    <div>
      <PageHeader title="Budget & Financials" description="Planned vs actual spend, cost metrics, and true profit margin." />

      <SampleDataBanner tone="warning">
        Every figure on this page is placeholder data — the cost metrics, the budget chart, and the alert rules. Do not
        use any of it for financial decisions. Real numbers require a connected ad platform.
      </SampleDataBanner>

      <div className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {costMetrics.map(([label, value]) => (
            <Card key={label} className="p-4">
              <p className="text-[10px] text-[var(--color-text-secondary)] mb-1.5">{label}</p>
              <p className="mono text-lg font-medium">{value}</p>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Budget Planner — Planned vs Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={budgetByCampaign}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#9490A8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9490A8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#18181F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => formatCurrency(Number(v))}
                />
                <Bar dataKey="planned" fill="#2AFFD3" fillOpacity={0.35} radius={[4, 4, 0, 0]} name="Planned" />
                <Bar dataKey="actual" fill="#7C5CFC" radius={[4, 4, 0, 0]} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit Margin Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 px-3 py-2.5">
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                  This calculator uses placeholder revenue ({formatCurrency(revenue)}) and spend ({formatCurrency(spend)}
                  ) figures, so the margin it returns is <span className="text-[var(--color-text-primary)]">not your
                  real margin</span>. It becomes accurate once your platform data is syncing.
                </p>
              </div>
              <div>
                <Label>COGS ($)</Label>
                <Input value={cogs} onChange={(e) => setCogs(e.target.value)} placeholder="e.g. 95000" />
              </div>
              <div>
                <Label>Refund Rate (%)</Label>
                <Input value={refundRate} onChange={(e) => setRefundRate(e.target.value)} placeholder="e.g. 4" />
              </div>
              <div className="pt-2">
                <p className="text-[10px] text-[var(--color-text-secondary)]">
                  True Profit Margin <span className="text-[var(--color-warning)]">(sample figures)</span>
                </p>
                <p className="mono text-xl text-[var(--color-violet)] font-medium">{margin ? `${margin}%` : '—'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget Alert Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Meta — Summer Launch', pct: 114 },
                { label: 'TikTok — BFCM Prep', pct: 76 },
                { label: 'Google — Evergreen', pct: 89 },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span>{r.label}</span>
                    <span className={`mono ${r.pct > 100 ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-secondary)]'}`}>{r.pct}%</span>
                  </div>
                  <Progress value={Math.min(100, r.pct)} barClassName={r.pct > 100 ? 'bg-[var(--color-danger)]' : undefined} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
