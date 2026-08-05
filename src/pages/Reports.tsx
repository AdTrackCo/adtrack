import { useState } from 'react'
import { toast } from 'sonner'
import { FileText, Link2, Calendar } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'

const templates = [
  'Weekly Creative Performance',
  'Monthly Campaign Summary',
  'Cross-Platform ROAS Overview',
  'Audience Analysis',
  'Testing Results Summary',
]

export function Reports() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div>
      <PageHeader title="Reports" description="Build, schedule, and share client-ready reports." />

      <div className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <Card
              key={t}
              className={`p-5 cursor-pointer transition-base ${selected === t ? 'border-[var(--color-violet)]' : 'hover:border-white/20'}`}
              onClick={() => setSelected(t)}
            >
              <FileText size={17} className="text-[var(--color-violet)] mb-3" />
              <p className="text-sm font-medium">{t}</p>
              <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">Pre-built template</p>
            </Card>
          ))}
        </div>

        <Card className="p-5">
          <p className="text-sm font-medium mb-4">Report Builder</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <Select>
              <option>Date Range: Last 30 days</option>
              <option>Last 7 days</option>
              <option>Custom</option>
            </Select>
            <Select>
              <option>Breakdown: Platform</option>
              <option>Campaign</option>
              <option>Creative</option>
            </Select>
            <Select>
              <option>All Platforms</option>
              <option>Meta only</option>
              <option>Google only</option>
            </Select>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="primary" size="sm" onClick={() => toast.success('Report generated ✓')}>
              Generate Report
            </Button>
            <Button variant="secondary" size="sm" onClick={() => toast.success('Exported as PDF ✓')}>
              Export PDF
            </Button>
            <Button variant="secondary" size="sm" onClick={() => toast.success('Exported as CSV ✓')}>
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success('Shareable link copied ✓')}>
              <Link2 size={13} /> Shareable Link
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-medium mb-3 flex items-center gap-2">
            <Calendar size={14} className="text-[var(--color-violet)]" /> Scheduled Reports
          </p>
          <div className="space-y-2">
            {[
              { name: 'Weekly Creative Performance', freq: 'Every Monday, 8:00 AM' },
              { name: 'Monthly Campaign Summary', freq: '1st of each month' },
            ].map((r) => (
              <div key={r.name} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-xs">
                <span>{r.name}</span>
                <span className="text-[var(--color-text-secondary)] mono">{r.freq}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
