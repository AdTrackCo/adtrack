import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Copy, Loader2 } from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'
import { platforms, angles, hooks, stages } from '@/lib/mockData'
import { updateCreativeSet } from '@/lib/creativesService'
import { useCreatives } from '@/lib/CreativesContext'
import type { CreativeSet, Platform } from '@/types'

const ctaOptions = ['Shop Now', 'Learn More', 'Sign Up', 'Get Started', 'Book Now', 'Contact Us', 'Download', 'Watch More', 'Apply Now', 'Get Offer']
const statusOptions = ['Draft', 'In Review', 'Live', 'Paused', 'Testing', 'Rejected', 'Archived']

export function EditCreativeDrawer({
  creative,
  onOpenChange,
}: {
  creative: CreativeSet | null
  onOpenChange: (open: boolean) => void
}) {
  const { refresh } = useCreatives()
  const [saving, setSaving] = useState(false)

  const [platform, setPlatform] = useState<Platform>('Meta')
  const [format, setFormat] = useState('Image')
  const [stage, setStage] = useState('TOFU')
  const [angle, setAngle] = useState(angles[0])
  const [hookType, setHookType] = useState(hooks[0])
  const [version, setVersion] = useState(1)
  const [status, setStatus] = useState('Draft')
  const [hookText, setHookText] = useState('')
  const [primaryText, setPrimaryText] = useState('')
  const [headline, setHeadline] = useState('')
  const [description, setDescription] = useState('')
  const [cta, setCta] = useState(ctaOptions[0])
  const [notes, setNotes] = useState('')
  const [compliance, setCompliance] = useState(80)

  // Re-hydrate the form whenever a different creative is opened for editing.
  useEffect(() => {
    if (!creative) return
    setPlatform(creative.platform)
    setFormat(creative.format)
    setStage(creative.funnelStage)
    setAngle(creative.angle)
    setHookType(creative.hookType)
    setVersion(creative.version)
    setStatus(creative.status)
    setHookText(creative.hookText)
    setPrimaryText(creative.primaryText)
    setHeadline(creative.headline)
    setDescription(creative.description)
    setCta(creative.cta || ctaOptions[0])
    setNotes(creative.notes)
    setCompliance(creative.complianceScore)
  }, [creative])

  if (!creative) return null

  const today = new Date()
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
  // Preserve the creative's original date prefix rather than stamping today's
  // date, so editing metadata doesn't rewrite when it was actually created.
  const originalDatePrefix = creative.name.split('_')[0] || dateStr
  const generatedName = `${originalDatePrefix}_${platform.toUpperCase()}_${stage}_${angle.replace(/\s/g, '')}_${hookType}_v${version}`

  async function handleSave() {
    if (!creative) return
    setSaving(true)
    try {
      await updateCreativeSet(creative.id, generatedName, {
        platform,
        format,
        funnelStage: stage,
        angle,
        hookType,
        version,
        status: status as CreativeSet['status'],
        hookText,
        primaryText,
        headline,
        description,
        cta,
        notes,
        complianceScore: compliance,
      })
      await refresh()
      toast.success('Creative updated ✓')
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save changes.', { duration: 8000 })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer
      open={!!creative}
      onOpenChange={onOpenChange}
      title="Edit Creative"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving…
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </>
      }
    >
      <div className="p-6 space-y-8">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-elevated)] p-3 text-[11px] text-[var(--color-text-secondary)]">
          Editing details for this creative. Size variants and the uploaded asset can't be changed here yet — delete and
          re-upload if you need to swap images.
        </div>

        <section>
          <h4 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">Creative Details</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Platform</Label>
              <Select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)}>
                {platforms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Format</Label>
              <Select value={format} onChange={(e) => setFormat(e.target.value)}>
                <option>Image</option>
                <option>Video</option>
                <option>Carousel</option>
              </Select>
            </div>
            <div>
              <Label>Funnel Stage</Label>
              <Select value={stage} onChange={(e) => setStage(e.target.value)}>
                {stages.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Angle</Label>
              <Select value={angle} onChange={(e) => setAngle(e.target.value as any)}>
                {angles.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Hook Type</Label>
              <Select value={hookType} onChange={(e) => setHookType(e.target.value as any)}>
                {hooks.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Version</Label>
              <Input type="number" min={1} value={version} onChange={(e) => setVersion(Number(e.target.value) || 1)} />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-2.5">
            <span className="mono text-xs text-[var(--color-violet)] truncate">{generatedName}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedName)
                toast.success('Name copied ✓')
              }}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] shrink-0 ml-2"
            >
              <Copy size={13} />
            </button>
          </div>
        </section>

        <section>
          <h4 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">Ad Copy</h4>
          <div className="space-y-3">
            <div>
              <Label>Hook Text ({hookText.length}/150)</Label>
              <Input maxLength={150} value={hookText} onChange={(e) => setHookText(e.target.value)} />
            </div>
            <div>
              <Label>Primary Text ({primaryText.length}/500)</Label>
              <Textarea maxLength={500} rows={3} value={primaryText} onChange={(e) => setPrimaryText(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Headline ({headline.length}/100)</Label>
                <Input maxLength={100} value={headline} onChange={(e) => setHeadline(e.target.value)} />
              </div>
              <div>
                <Label>Description ({description.length}/200)</Label>
                <Input maxLength={200} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>CTA</Label>
              <Select value={cta} onChange={(e) => setCta(e.target.value)}>
                {ctaOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </section>

        <section>
          <h4 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">Status & Notes</h4>
          <div className="space-y-3">
            <div>
              <Label>Status</Label>
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div>
              <Label>Brand Compliance Score ({compliance})</Label>
              <input
                type="range"
                min={0}
                max={100}
                value={compliance}
                onChange={(e) => setCompliance(Number(e.target.value))}
                className="w-full accent-[var(--color-violet)]"
              />
            </div>
          </div>
        </section>
      </div>
    </Drawer>
  )
}
