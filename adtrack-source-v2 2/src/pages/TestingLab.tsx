import { Plus, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { generateABTests } from '@/lib/mockData'

const tests = generateABTests(8)

const statusTone: Record<string, 'success' | 'violet' | 'muted'> = {
  Running: 'violet',
  Completed: 'success',
  Draft: 'muted',
}

const fatigueCreatives = [
  { name: '20240611_META_TOFU_Pain_QuestionHook_v2', frequency: 4.3, ctrDrop: 34 },
  { name: '20240622_TIKTOK_BOFU_Urgency_StatHook_v1', frequency: 5.1, ctrDrop: 41 },
]

export function TestingLab() {
  return (
    <div>
      <PageHeader
        title="Testing Lab"
        description="Every A/B test, tracked with statistical rigor."
        actions={
          <Button variant="primary" size="sm">
            <Plus size={13} /> New Test
          </Button>
        }
      />

      <div className="p-6 md:p-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-[var(--color-warning)]" /> Creative Fatigue Monitor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {fatigueCreatives.map((f) => (
              <div key={f.name} className="flex items-center justify-between rounded-lg border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 px-3 py-2.5">
                <p className="mono text-xs">{f.name}</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="mono text-[var(--color-text-secondary)]">Freq {f.frequency}</span>
                  <span className="mono text-[var(--color-danger)] flex items-center gap-1">
                    <TrendingDown size={12} /> CTR -{f.ctrDrop}%
                  </span>
                  <Button variant="secondary" size="sm">
                    Refresh Recommendation
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tests.map((t) => (
            <Card key={t.id} className="p-5">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium">{t.name}</p>
                <Badge tone={statusTone[t.status]}>{t.status}</Badge>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mb-4">{t.hypothesis}</p>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="rounded-lg border border-[var(--color-border)] p-2.5">
                  <p className="text-[10px] text-[var(--color-text-secondary)]">Variant A — Control</p>
                </div>
                <div className={`rounded-lg border p-2.5 ${t.winner === 'B' ? 'border-[var(--color-success)]/40 bg-[var(--color-success)]/5' : 'border-[var(--color-border)]'}`}>
                  <p className="text-[10px] text-[var(--color-text-secondary)]">Variant B</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[var(--color-text-secondary)]">Confidence</span>
                <span className="mono">{t.confidence}%</span>
              </div>
              <Progress value={t.confidence} barClassName={t.confidence >= 95 ? 'bg-[var(--color-success)]' : undefined} />

              <div className="flex items-center justify-between mt-3">
                <span className={`mono text-sm flex items-center gap-1 ${t.lift >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                  {t.lift >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {t.lift >= 0 ? '+' : ''}
                  {t.lift}% ROAS
                </span>
                {t.winner && (
                  <span className="text-[11px] text-[var(--color-success)]">Winner: Variant {t.winner}</span>
                )}
              </div>

              {t.learnings && (
                <p className="text-[11px] text-[var(--color-text-secondary)] mt-3 pt-3 border-t border-[var(--color-border)]">{t.learnings}</p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
