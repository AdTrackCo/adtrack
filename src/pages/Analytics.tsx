import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts'
import { Download } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Select, Input, Label } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { RoasTrendChart } from '@/components/dashboard/RoasTrendChart'
import { SampleDataBanner } from '@/components/common/SampleDataBanner'
import { formatCurrency } from '@/lib/utils'

const breakdowns = ['Platform', 'Campaign', 'Ad Set', 'Creative', 'Audience', 'Placement', 'Device', 'Age', 'Gender', 'Country']

const daypartData = Array.from({ length: 7 }, (_, d) =>
  Array.from({ length: 24 }, (_, h) => ({
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d],
    hour: h,
    roas: Number((Math.sin(h / 3) * 1.2 + 2.5 + (d > 3 ? 0.6 : 0)).toFixed(2)),
  }))
).flat()

const scatterData = Array.from({ length: 30 }, (_, i) => ({
  spend: Math.round(500 + Math.random() * 15000),
  roas: Number((1 + Math.random() * 5).toFixed(2)),
  z: Math.round(50 + Math.random() * 250),
}))

const platformBar = [
  { name: 'Meta', roas: 3.8 },
  { name: 'Google', roas: 3.1 },
  { name: 'TikTok', roas: 2.6 },
  { name: 'Snapchat', roas: 2.1 },
]

function heatColor(roas: number) {
  const t = Math.max(0, Math.min(1, (roas - 1.5) / 3))
  const r = Math.round(24 + t * 100)
  const g = Math.round(24 + t * 70)
  const b = Math.round(31 + t * 200)
  return `rgb(${r},${g},${b})`
}

export function Analytics() {
  const [breakdown, setBreakdown] = useState('Platform')
  const [backendRevenue, setBackendRevenue] = useState('')
  const platformSpendTotal = 97300
  const blended = backendRevenue ? (Number(backendRevenue) / platformSpendTotal).toFixed(2) : null

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Cross-platform performance, broken down however you need."
        actions={
          <Button variant="outline" size="sm" disabled title="Requires real performance data">
            <Download size={13} /> Export
          </Button>
        }
      />

      <SampleDataBanner tone="warning">
        Every chart here is generated sample data, not your account. The spend-vs-ROAS scatter plot is randomized on
        each page load, so the points change every refresh. The blended ROAS calculator below divides your input by a
        placeholder spend figure of $97,300 — its answer is not meaningful.
      </SampleDataBanner>

      <div className="p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={breakdown} onChange={(e) => setBreakdown(e.target.value)} className="w-auto">
            {breakdowns.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </Select>
          <Select className="w-auto">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>vs Last Month</option>
            <option>Custom Range</option>
          </Select>
          <Select className="w-auto">
            <option>Attribution: 7-day click</option>
            <option>Attribution: 1-day click</option>
            <option>Attribution: 1-day view</option>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ROAS Trend by {breakdown}</CardTitle>
          </CardHeader>
          <CardContent>
            <RoasTrendChart />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>ROAS by Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={platformBar}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#9490A8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9490A8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#18181F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="roas" fill="#7C5CFC" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spend vs ROAS</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" dataKey="spend" name="Spend" tick={{ fill: '#9490A8', fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                  <YAxis type="number" dataKey="roas" name="ROAS" tick={{ fill: '#9490A8', fontSize: 11 }} />
                  <ZAxis dataKey="z" range={[40, 200]} />
                  <Tooltip
                    contentStyle={{ background: '#18181F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v, name) => (name === 'Spend' ? formatCurrency(Number(v)) : v)}
                  />
                  <Scatter data={scatterData} fill="#2AFFD3" fillOpacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dayparting — ROAS by Hour & Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-[40px_repeat(24,1fr)] gap-[2px] min-w-[700px]">
                <div />
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className="text-[9px] text-[var(--color-text-secondary)] text-center">
                    {h}
                  </div>
                ))}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="contents">
                    <div className="text-[10px] text-[var(--color-text-secondary)] flex items-center">{day}</div>
                    {daypartData
                      .filter((d) => d.day === day)
                      .map((d, i) => (
                        <div
                          key={i}
                          title={`${d.roas}x`}
                          className="h-5 rounded-[2px]"
                          style={{ background: heatColor(d.roas) }}
                        />
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blended ROAS Calculator</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end gap-4">
            <div className="flex-1 max-w-xs">
              <Label>Backend Revenue (all channels)</Label>
              <Input placeholder="e.g. 330000" value={backendRevenue} onChange={(e) => setBackendRevenue(e.target.value)} />
            </div>
            <div className="pb-2">
              <p className="text-[10px] text-[var(--color-text-secondary)]">True Blended ROAS</p>
              <p className="mono text-xl text-[var(--color-violet)] font-medium">{blended ? `${blended}x` : '—'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
