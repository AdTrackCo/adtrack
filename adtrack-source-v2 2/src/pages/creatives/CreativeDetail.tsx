import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Copy, Pencil, Sparkles, PlayCircle, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Progress } from '@/components/ui/Progress'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatCurrency } from '@/lib/utils'
import { getComments, addComment, type Comment } from '@/lib/comments'
import { useAuth } from '@/lib/AuthContext'
import { useCreatives } from '@/lib/CreativesContext'
import { EditCreativeDrawer } from '@/components/creatives/EditCreativeDrawer'
import type { CreativeVariant } from '@/types'

export function CreativeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { creatives } = useCreatives()
  const creative = creatives.find((c) => c.id === id) || creatives[0]

  const [activeVariant, setActiveVariant] = useState<CreativeVariant | undefined>(creative?.variants[0])
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    if (!creative) return
    setActiveVariant(creative.variants[0])
    getComments(creative.id).then(setComments)
  }, [creative?.id])

  if (!creative) {
    return (
      <div className="p-8 text-sm text-[var(--color-text-secondary)]">
        Creative not found.{' '}
        <button onClick={() => navigate('/creatives')} className="text-[var(--color-violet)] hover:underline">
          Back to library
        </button>
      </div>
    )
  }

  async function submitComment() {
    if (!commentText.trim()) return
    const authorName = (user?.user_metadata as any)?.full_name || user?.email || 'You'
    try {
      const c = await addComment(creative.id, authorName, commentText.trim())
      setComments((prev) => [...prev, c])
      setCommentText('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not post comment.')
    }
  }

  return (
    <div>
      <div className="px-6 md:px-8 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/creatives')} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
          <ArrowLeft size={16} />
        </button>
        <span className="text-xs text-[var(--color-text-secondary)]">Creative Library</span>
      </div>

      <div className="px-6 md:px-8 pb-10 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-elevated)] aspect-video flex items-center justify-center relative overflow-hidden">
            {activeVariant?.assetUrl ? (
              activeVariant.assetType === 'video' ? (
                <video src={activeVariant.assetUrl} controls className="h-full w-full object-contain bg-black" />
              ) : (
                <img src={activeVariant.assetUrl} alt={creative.name} className="h-full w-full object-contain" />
              )
            ) : (
              <>
                <div className="flex flex-col items-center text-center px-6">
                  <Sparkles size={28} className="text-[var(--color-violet)]/40 mb-3" />
                  <p className="text-sm text-[var(--color-text-secondary)]">No asset uploaded</p>
                  <p className="text-xs text-[var(--color-text-secondary)]/60 mt-1">Sample data — upload your own asset to preview it here</p>
                </div>
                {activeVariant?.assetType === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <PlayCircle size={22} className="text-white" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="mono text-sm truncate flex-1">{creative.name}</p>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(creative.name)
                  toast.success('Name copied ✓')
                }}
              >
                <Copy size={14} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setEditOpen(true)}>
                <Pencil size={14} />
              </Button>
            </div>
          </div>

          <div>
            <p className="text-xs text-[var(--color-text-secondary)] mb-2">Size Variants</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {creative.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveVariant(v)}
                  className={`shrink-0 w-32 rounded-lg border p-2 text-left transition-base ${
                    activeVariant?.id === v.id ? 'border-[var(--color-violet)]' : 'border-[var(--color-border)] hover:border-white/20'
                  }`}
                >
                  <div className="h-16 rounded-md bg-[var(--color-elevated)] flex items-center justify-center mb-2 overflow-hidden">
                    {v.assetUrl && v.assetType === 'image' ? (
                      <img src={v.assetUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Sparkles size={14} className="text-[var(--color-violet)]/30" />
                    )}
                  </div>
                  <p className="text-[10px] mono">
                    {v.width} × {v.height}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-secondary)] truncate">{v.placementLabel}</p>
                </button>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Textarea
                  rows={2}
                  placeholder="Leave a comment about this creative…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <Button variant="primary" size="icon" onClick={submitComment}>
                  <Send size={14} />
                </Button>
              </div>
              <div className="space-y-4">
                {comments.length === 0 && <p className="text-xs text-[var(--color-text-secondary)]">No comments yet.</p>}
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-[var(--color-violet)]/15 text-[var(--color-violet)] text-[11px] flex items-center justify-center shrink-0 mono">
                      {c.authorName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs">
                        <span className="font-medium">{c.authorName}</span>{' '}
                        <span className="text-[var(--color-text-secondary)]">{new Date(c.createdAt).toLocaleString()}</span>
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => toast('Manual metrics entry isn\'t wired up yet — coming with the sync layer.')}>
                Edit Metrics
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              {[
                ['ROAS', `${creative.roas.toFixed(2)}x`],
                ['CTR', `${creative.ctr.toFixed(1)}%`],
                ['Spend', formatCurrency(creative.spend)],
                ['Impressions', creative.impressions.toLocaleString()],
                ['Clicks', creative.clicks.toLocaleString()],
                ['Conversions', creative.conversions.toLocaleString()],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] text-[var(--color-text-secondary)] mb-1">{label}</p>
                  <p className="mono text-sm font-medium">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Creative Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {[
                ['Platform', creative.platform],
                ['Format', creative.format],
                ['Funnel Stage', creative.funnelStage],
                ['Angle', creative.angle],
                ['Hook Type', creative.hookType],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">{label}</span>
                  <span>{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-secondary)]">Status</span>
                <StatusBadge status={creative.status} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[var(--color-text-secondary)]">Brand Compliance</span>
                  <span className="mono">{creative.complianceScore}</span>
                </div>
                <Progress value={creative.complianceScore} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ad Copy</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
                Edit Copy
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {[
                ['Hook', creative.hookText],
                ['Primary Text', creative.primaryText],
                ['Headline', creative.headline],
                ['Description', creative.description],
                ['CTA', creative.cta],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3 group">
                  <div className="min-w-0">
                    <p className="text-[10px] text-[var(--color-text-secondary)] mb-0.5">{label}</p>
                    <p className="text-[var(--color-text-primary)]">{value}</p>
                  </div>
                  <button
                    className="shrink-0 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] opacity-0 group-hover:opacity-100 transition-base"
                    onClick={() => {
                      navigator.clipboard.writeText(String(value))
                      toast.success('Copied ✓')
                    }}
                  >
                    <Copy size={12} />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Where Used</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[var(--color-text-secondary)]">No linked campaigns yet — connect a platform to see where this creative is running.</p>
            </CardContent>
          </Card>

          <Card className="border-[var(--color-violet)]/30">
            <CardContent className="pt-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[var(--color-violet)]" />
                <span className="text-sm">AI Analysis</span>
              </div>
              <Link to="/ai-assistant">
                <Button variant="primary" size="sm">
                  Analyze This Creative
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditCreativeDrawer creative={editOpen ? creative : null} onOpenChange={(open) => setEditOpen(open)} />
    </div>
  )
}
