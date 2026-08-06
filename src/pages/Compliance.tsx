import { ShieldAlert, ShieldCheck, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PlatformBadge } from '@/components/common/PlatformBadge'
import { SampleDataBanner } from '@/components/common/SampleDataBanner'

const disapprovals = [
  { name: '20240705_META_BOFU_Urgency_StatHook_v1', platform: 'Meta' as const, reason: 'Personal Attributes Policy', link: 'https://www.facebook.com/policies/ads' },
  { name: '20240628_GOOGLE_TOFU_Pain_QuestionHook_v3', platform: 'Google' as const, reason: 'Misleading Claims', link: 'https://support.google.com/adspolicy' },
]

const anomalies = [
  { title: 'Unusual spend spike — TikTok', detail: 'Spend increased 3.4x in a 2-hour window with no bid changes logged.' },
  { title: 'Click fraud indicator — Google Display', detail: 'CTR anomaly with sub-1-second average session duration detected on 3 placements.' },
]

const legalNotes = ['No unsubstantiated guarantees in active copy', 'Trademark usage cleared for Q3 creative set', 'Health claim review required before BOFU push'];

export function Compliance() {
  return (
    <div>
      <PageHeader title="Compliance & Risk" description="Approval status, policy flags, and anomaly detection across platforms." />

      <SampleDataBanner tone="warning">
        None of these flags are real. The disapprovals, fraud indicators, and spend anomalies below are example content
        for creatives that don't exist in your account. No ad platform is connected, so nothing here reflects your
        actual approval status — check your ad manager directly for that.
      </SampleDataBanner>

      <div className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert size={14} className="text-[var(--color-danger)]" /> Disapproved Ads
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {disapprovals.map((d) => (
                <div key={d.name} className="rounded-lg border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 p-3">
                  <div className="flex items-center justify-between">
                    <p className="mono text-xs">{d.name}</p>
                    <PlatformBadge platform={d.platform} />
                  </div>
                  <a href={d.link} target="_blank" rel="noreferrer" className="text-[11px] text-[var(--color-violet)] flex items-center gap-1 mt-1.5 hover:underline">
                    {d.reason} <ExternalLink size={10} />
                  </a>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert size={14} className="text-[var(--color-warning)]" /> Anomaly Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {anomalies.map((a) => (
                <div key={a.title} className="rounded-lg border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 p-3">
                  <p className="text-xs font-medium">{a.title}</p>
                  <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">{a.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Legal & Disclosure Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {legalNotes.map((n) => (
                <div key={n} className="flex items-start gap-2 text-xs">
                  <ShieldCheck size={13} className="text-[var(--color-success)] shrink-0 mt-0.5" />
                  <span>{n}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span>GDPR</span>
                <Badge tone="success">Compliant</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>CCPA</span>
                <Badge tone="success">Compliant</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Consent Mode (Google)</span>
                <Badge tone="warning">Needs Review</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
