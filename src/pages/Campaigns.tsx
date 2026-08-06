import { useState } from 'react'
import { ChevronDown, ChevronRight, Play, Pause, Copy, Download } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PlatformBadge } from '@/components/common/PlatformBadge'
import { Badge } from '@/components/ui/Badge'
import { SampleDataBanner } from '@/components/common/SampleDataBanner'
import { generateCampaigns } from '@/lib/mockData'
import { formatCurrency } from '@/lib/utils'

const campaigns = generateCampaigns(12)

const statusTone: Record<string, 'success' | 'warning' | 'muted'> = {
  Active: 'success',
  Paused: 'warning',
  Ended: 'muted',
  Draft: 'muted',
}

export function Campaigns() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggleExpand(id: string) {
    const next = new Set(expanded)
    next.has(id) ? next.delete(id) : next.add(id)
    setExpanded(next)
  }

  function toggleSelect(id: string) {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  return (
    <div>
      <PageHeader
        title="Campaigns"
        description="Campaign → Ad Set → Ad hierarchy across every platform."
        actions={
          <>
            {selected.size > 0 && (
              <>
                <Button variant="secondary" size="sm" disabled title="Requires a connected ad platform">
                  <Pause size={13} /> Pause ({selected.size})
                </Button>
                <Button variant="secondary" size="sm" disabled title="Requires a connected ad platform">
                  <Copy size={13} /> Duplicate
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" disabled title="Requires real campaign data">
              <Download size={13} /> Export
            </Button>
          </>
        }
      />

      <SampleDataBanner>
        These campaigns are placeholders, not your real ad accounts. Pause, Duplicate, and Export are disabled until a
        platform is connected in Settings → Integrations.
      </SampleDataBanner>

      <div className="p-6 md:p-8 space-y-3">
        {campaigns.map((c) => (
          <Card key={c.id} className="overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="accent-[var(--color-violet)]" />
              <button onClick={() => toggleExpand(c.id)} className="text-[var(--color-text-secondary)]">
                {expanded.has(c.id) ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{c.name}</p>
                <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">{c.objective} · Started {c.startDate}</p>
              </div>
              <PlatformBadge platform={c.platform} />
              <Badge tone={statusTone[c.status]}>{c.status}</Badge>
              <div className="text-right w-24">
                <p className="mono text-xs text-[var(--color-text-secondary)]">Spend</p>
                <p className="mono text-sm">{formatCurrency(c.spend)}</p>
              </div>
              <div className="text-right w-32">
                <p className="mono text-xs text-[var(--color-text-secondary)]">ROAS (goal {c.roasTarget.toFixed(1)}x)</p>
                <p className={`mono text-sm ${c.roas >= c.roasTarget ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                  {c.roas.toFixed(2)}x
                </p>
              </div>
              <button className="text-[var(--color-text-secondary)] hover:text-[var(--color-violet)]">
                {c.status === 'Active' ? <Pause size={15} /> : <Play size={15} />}
              </button>
            </div>

            {expanded.has(c.id) && (
              <div className="border-t border-[var(--color-border)] bg-black/10 px-4 py-3 space-y-2">
                {c.adSets.map((as) => (
                  <div key={as.id} className="pl-6">
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-xs">{as.name}</span>
                      <div className="flex items-center gap-6">
                        <Badge tone={as.status === 'Active' ? 'success' : 'warning'}>{as.status}</Badge>
                        <span className="mono text-xs w-20 text-right">{formatCurrency(as.spend)}</span>
                        <span className="mono text-xs w-16 text-right text-[var(--color-violet)]">{as.roas.toFixed(2)}x</span>
                      </div>
                    </div>
                    <div className="pl-6 space-y-1">
                      {as.ads.map((ad) => (
                        <div key={ad.id} className="flex items-center justify-between py-1 text-[11px] text-[var(--color-text-secondary)]">
                          <span>{ad.name}</span>
                          <div className="flex items-center gap-6">
                            <Badge tone={ad.status === 'Active' ? 'success' : 'warning'}>{ad.status}</Badge>
                            <span className="mono w-20 text-right">{formatCurrency(ad.spend)}</span>
                            <span className="mono w-16 text-right">{ad.roas.toFixed(2)}x</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
