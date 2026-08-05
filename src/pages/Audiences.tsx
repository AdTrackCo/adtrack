import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PlatformBadge } from '@/components/common/PlatformBadge'
import { generateAudiences } from '@/lib/mockData'
import { formatNumber } from '@/lib/utils'

const audiences = generateAudiences(14)

const typeTone: Record<string, 'violet' | 'teal' | 'muted'> = {
  Lookalike: 'violet',
  Custom: 'teal',
  Broad: 'muted',
}

export function Audiences() {
  return (
    <div>
      <PageHeader
        title="Audiences"
        description="Every audience across every platform, ranked by performance."
        actions={
          <Button variant="primary" size="sm">
            <Plus size={13} /> New Audience
          </Button>
        }
      />

      <div className="p-6 md:p-8">
        <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Platform</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium text-right">Est. Size</th>
                <th className="px-4 py-3 font-medium text-right">ROAS</th>
                <th className="px-4 py-3 font-medium text-right">CPA</th>
                <th className="px-4 py-3 font-medium text-right">CTR</th>
              </tr>
            </thead>
            <tbody>
              {audiences.map((a, i) => (
                <tr key={a.id} className="border-b border-[var(--color-border)] last:border-0" style={{ background: i % 2 === 1 ? 'rgba(255,255,255,0.02)' : undefined }}>
                  <td className="px-4 py-3 text-xs">{a.name}</td>
                  <td className="px-4 py-3">
                    <PlatformBadge platform={a.platform} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={typeTone[a.type]}>{a.type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">{a.source}</td>
                  <td className="px-4 py-3 mono text-xs text-right">{formatNumber(a.estimatedSize)}</td>
                  <td className="px-4 py-3 mono text-xs text-right text-[var(--color-violet)]">{a.roas.toFixed(2)}x</td>
                  <td className="px-4 py-3 mono text-xs text-right">${a.cpa.toFixed(2)}</td>
                  <td className="px-4 py-3 mono text-xs text-right">{a.ctr.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Card className="mt-6 p-5">
          <p className="text-sm font-medium mb-1">Retargeting List Manager</p>
          <p className="text-xs text-[var(--color-text-secondary)] mb-4">Time windows and trigger actions for retargeting audiences.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {['View 7d', 'Add to Cart 14d', 'Purchase 30d Exclusion'].map((label) => (
              <div key={label} className="rounded-lg border border-[var(--color-border)] p-3">
                <p className="text-xs">{label}</p>
                <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">Meta, TikTok</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
