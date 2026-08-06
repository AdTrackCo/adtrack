import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Upload, X, Copy, Plus, Trash2, Info, Loader2 } from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'
import { Progress } from '@/components/ui/Progress'
import { platforms, angles, hooks, stages, placementPresets } from '@/lib/mockData'
import { createCreativeSet } from '@/lib/creativesService'
import { useCreatives } from '@/lib/CreativesContext'
import type { CreativeStatus, Platform } from '@/types'

interface VariantSlot {
  id: string
  placement: string
  width: number
  height: number
  file: File | null
}

/** Reads real pixel dimensions from an image/video file. */
function readDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const done = (width: number, height: number) => {
      URL.revokeObjectURL(url)
      resolve({ width, height })
    }

    if (file.type.startsWith('video')) {
      const video = document.createElement('video')
      video.onloadedmetadata = () => done(video.videoWidth, video.videoHeight)
      video.onerror = () => done(0, 0)
      video.src = url
      return
    }

    const img = new Image()
    img.onload = () => done(img.naturalWidth, img.naturalHeight)
    img.onerror = () => done(0, 0)
    img.src = url
  })
}

const ctaOptions = ['Shop Now', 'Learn More', 'Sign Up', 'Get Started', 'Book Now', 'Contact Us', 'Download', 'Watch More', 'Apply Now', 'Get Offer']

const METRICS_PREF_KEY = 'adtrack_metrics_pref'

export function UploadDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { refresh } = useCreatives()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)
  const [saving, setSaving] = useState(false)

  const [platform, setPlatform] = useState<Platform>('Meta')
  const [format, setFormat] = useState('Image')
  const [stage, setStage] = useState('TOFU')
  const [angle, setAngle] = useState(angles[0])
  const [hookType, setHookType] = useState(hooks[0])
  const [version, setVersion] = useState(1)

  const [hookText, setHookText] = useState('')
  const [primaryText, setPrimaryText] = useState('')
  const [headline, setHeadline] = useState('')
  const [description, setDescription] = useState('')
  const [cta, setCta] = useState(ctaOptions[0])

  const [variants, setVariants] = useState<VariantSlot[]>([])
  const [status, setStatus] = useState('Draft')
  const [notes, setNotes] = useState('')
  const [compliance, setCompliance] = useState(80)

  const [metricsPref, setMetricsPref] = useState<'manual' | 'sync' | 'ask' | null>(
    () => (localStorage.getItem(METRICS_PREF_KEY) as any) || null
  )
  const [roas, setRoas] = useState('')
  const [ctr, setCtr] = useState('')
  const [spend, setSpend] = useState('')

  const today = new Date()
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
  const generatedName = `${dateStr}_${platform.toUpperCase()}_${stage}_${angle.replace(/\s/g, '')}_${hookType}_v${version}`

  const filledSections = [!!fileName, !!headline || !!hookText, true, variants.length >= 0].filter(Boolean).length
  const progressPct = (filledSections / 4) * 100

  async function handleFile(selected: File) {
    const MAX_BYTES = 500 * 1024 * 1024
    if (selected.size > MAX_BYTES) {
      toast.error('That file is larger than the 500MB limit.')
      return
    }
    setFile(selected)
    setFileName(selected.name)
    setFileSize(`${(selected.size / (1024 * 1024)).toFixed(1)} MB`)
    setDimensions(await readDimensions(selected))
  }

  function clearFile() {
    setFile(null)
    setFileName(null)
    setFileSize(null)
    setDimensions(null)
  }

  function addVariant() {
    if (variants.length >= 9) return
    const preset = (placementPresets[platform] || placementPresets.Meta)[0]
    setVariants([
      ...variants,
      { id: crypto.randomUUID(), placement: preset.label, width: preset.w, height: preset.h, file: null },
    ])
  }

  async function setVariantFile(id: string, selected: File) {
    const dims = await readDimensions(selected)
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, file: selected, width: dims.width || v.width, height: dims.height || v.height } : v))
    )
  }

  function updateVariantPlacement(id: string, label: string) {
    const preset = (placementPresets[platform] || placementPresets.Meta).find((p) => p.label === label)
    setVariants(variants.map((v) => (v.id === id ? { ...v, placement: label, width: preset?.w || v.width, height: preset?.h || v.height } : v)))
  }

  function removeVariant(id: string) {
    setVariants(variants.filter((v) => v.id !== id))
  }

  function copyName() {
    navigator.clipboard.writeText(generatedName)
    toast.success('Name copied to clipboard ✓')
  }

  function setPref(pref: 'manual' | 'sync' | 'ask') {
    setMetricsPref(pref)
    if (pref !== 'ask') localStorage.setItem(METRICS_PREF_KEY, pref)
  }

  function resetForm() {
    clearFile()
    setVariants([])
    setHookText('')
    setPrimaryText('')
    setHeadline('')
    setDescription('')
    setNotes('')
    setVersion(1)
    setStatus('Draft')
  }

  async function handleSave(publish: boolean) {
    if (!file) {
      toast.error('Add a primary asset before saving.')
      return
    }

    setSaving(true)
    try {
      const primaryPlacement = (placementPresets[platform] || placementPresets.Meta)[0]

      await createCreativeSet({
        name: generatedName,
        platform,
        format,
        funnelStage: stage,
        angle,
        hookType,
        version,
        status: (publish ? (status === 'Draft' ? 'In Review' : status) : 'Draft') as CreativeStatus,
        hookText,
        primaryText,
        headline,
        description,
        cta,
        notes,
        complianceScore: compliance,
        variants: [
          {
            file,
            placementLabel: primaryPlacement?.label ?? 'Primary',
            width: dimensions?.width ?? 0,
            height: dimensions?.height ?? 0,
          },
          ...variants.map((v) => ({
            file: v.file,
            placementLabel: v.placement,
            width: v.width,
            height: v.height,
          })),
        ],
      })

      await refresh()
      toast.success(publish ? 'Creative uploaded ✓' : 'Draft saved ✓')
      resetForm()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed.', { duration: 10000 })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Upload Creative"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => handleSave(false)} disabled={saving || !file}>
            Save Draft
          </Button>
          <Button variant="primary" onClick={() => handleSave(true)} disabled={saving || !file}>
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Uploading…
              </>
            ) : (
              'Upload Creative'
            )}
          </Button>
        </>
      }
    >
      <div className="px-6 pt-5">
        <Progress value={progressPct} />
      </div>

      <div className="p-6 space-y-8">
        {metricsPref === null && (
          <div className="rounded-lg border border-[var(--color-violet)]/30 bg-[var(--color-violet)]/5 p-4">
            <p className="text-sm font-medium mb-1 flex items-center gap-1.5">
              <Info size={13} className="text-[var(--color-violet)]" /> How would you like to track performance metrics?
            </p>
            <div className="flex gap-2 mt-3">
              <Button variant="secondary" size="sm" onClick={() => setPref('manual')}>
                Manual Entry
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setPref('sync')}>
                Platform Sync
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setPref('ask')}>
                Ask every time
              </Button>
            </div>
          </div>
        )}

        {/* Section 1 - Primary Asset */}
        <section>
          <h4 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">1. Primary Asset</h4>
          {!fileName ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
              }}
              className="rounded-lg border-2 border-dashed border-[var(--color-violet)]/40 hover:border-[var(--color-violet)] transition-base cursor-pointer flex flex-col items-center justify-center py-12 text-center"
            >
              <Upload size={22} className="text-[var(--color-violet)] mb-3" />
              <p className="text-sm">Drag & drop your primary creative here</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">JPG, PNG, GIF, WEBP, HEIC, MP4, MOV up to 500MB</p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-[var(--color-border)] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {file && file.type.startsWith('image') && (
                  <img src={URL.createObjectURL(file)} alt="" className="h-12 w-12 rounded-md object-cover shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm truncate">{fileName}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mono mt-1">
                    {fileSize}
                    {dimensions && dimensions.width > 0 ? ` · ${dimensions.width} × ${dimensions.height}` : ''}
                  </p>
                </div>
              </div>
              <button onClick={clearFile} className="text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] shrink-0">
                <X size={16} />
              </button>
            </div>
          )}
        </section>

        {/* Section 2 - Creative Details */}
        <section>
          <h4 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">2. Creative Details</h4>
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
              <Label>
                Funnel Stage{' '}
                <span className="text-[var(--color-text-secondary)]/70 normal-case">(Awareness / Consideration / Conversion)</span>
              </Label>
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
            <button onClick={copyName} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] shrink-0 ml-2">
              <Copy size={13} />
            </button>
          </div>
        </section>

        {/* Section 3 - Ad Copy */}
        <section>
          <h4 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">3. Ad Copy</h4>
          <div className="space-y-3">
            <div>
              <Label>Hook Text ({hookText.length}/150)</Label>
              <Input maxLength={150} value={hookText} onChange={(e) => setHookText(e.target.value)} placeholder="Stop guessing which ad is working…" />
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

        {/* Section 4 - Size Variants */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">4. Size Variants</h4>
            <span className="text-[10px] text-[var(--color-text-secondary)]">{variants.length + 1} / 10</span>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] p-3 flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-medium">Variant 1 (Primary)</p>
              <p className="text-[11px] text-[var(--color-text-secondary)] mono mt-0.5">
                {dimensions && dimensions.width > 0 ? `${dimensions.width} × ${dimensions.height}` : 'Add a primary asset above'}
              </p>
            </div>
            <Select className="w-40" defaultValue={(placementPresets[platform] || placementPresets.Meta)[0]?.label}>
              {(placementPresets[platform] || placementPresets.Meta).map((p) => (
                <option key={p.label} value={p.label}>
                  {p.label}
                </option>
              ))}
            </Select>
          </div>

          {variants.map((v) => (
            <div key={v.id} className="rounded-lg border border-[var(--color-border)] p-3 flex items-center justify-between mb-2">
              <div className="flex-1 min-w-0">
                <label className="text-xs font-medium cursor-pointer hover:text-[var(--color-violet)] transition-base">
                  {v.file ? v.file.name : 'Choose file…'}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={(e) => e.target.files?.[0] && setVariantFile(v.id, e.target.files[0])}
                  />
                </label>
                <p className="text-[11px] text-[var(--color-text-secondary)] mono mt-0.5">
                  {v.width} × {v.height}
                </p>
              </div>
              <Select className="w-40" value={v.placement} onChange={(e) => updateVariantPlacement(v.id, e.target.value)}>
                {(placementPresets[platform] || placementPresets.Meta).map((p) => (
                  <option key={p.label} value={p.label}>
                    {p.label}
                  </option>
                ))}
                <option value="Custom">Custom</option>
              </Select>
              <button onClick={() => removeVariant(v.id)} className="ml-2 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)]">
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {variants.length < 9 && (
            <Button variant="outline" size="sm" onClick={addVariant} className="w-full mt-1">
              <Plus size={13} /> Add Another Size
            </Button>
          )}
        </section>

        {/* Section 5 - Performance Metrics */}
        {metricsPref === 'manual' && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">5. Performance Metrics</h4>
              <button onClick={() => setMetricsPref(null)} className="text-[10px] text-[var(--color-violet)]">
                Change
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>ROAS</Label>
                <Input value={roas} onChange={(e) => setRoas(e.target.value)} placeholder="3.20" />
              </div>
              <div>
                <Label>CTR %</Label>
                <Input value={ctr} onChange={(e) => setCtr(e.target.value)} placeholder="2.10" />
              </div>
              <div>
                <Label>Total Spend</Label>
                <Input value={spend} onChange={(e) => setSpend(e.target.value)} placeholder="1200" />
              </div>
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-2">These metrics apply to the full creative set.</p>
          </section>
        )}

        {/* Section 6 - Status & Notes */}
        <section>
          <h4 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">6. Status & Notes</h4>
          <div className="space-y-3">
            <div>
              <Label>Status</Label>
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option>Draft</option>
                <option>In Review</option>
                <option>Live</option>
                <option>Paused</option>
                <option>Testing</option>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Strategy / hypothesis for this creative…" />
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
