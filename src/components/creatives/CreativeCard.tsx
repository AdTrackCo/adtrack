import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Eye, Pencil, PlayCircle, MoreVertical } from 'lucide-react'
import type { CreativeSet } from '@/types'
import { PlatformBadge } from '@/components/common/PlatformBadge'
import { StatusBadge } from '@/components/common/StatusBadge'
import { CreativeActionMenu } from './CreativeActionMenu'
import { formatCurrency } from '@/lib/utils'

export function CreativeCard({ creative, onEdit }: { creative: CreativeSet; onEdit: (c: CreativeSet) => void }) {
  const navigate = useNavigate()
  const [hover, setHover] = useState(false)
  const isVideo = creative.variants[0]?.assetType === 'video'
  // Freshly uploaded creatives have no performance data until a platform syncs.
  const hasMetrics = creative.impressions > 0 || creative.spend > 0

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => navigate(`/creatives/${creative.id}`)}
      className="group cursor-pointer rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden transition-base"
      style={hover ? { boxShadow: '0 0 0 1px rgba(124,92,252,0.4), 0 12px 24px -8px rgba(124,92,252,0.25)' } : undefined}
    >
      <div className="relative aspect-square bg-[var(--color-elevated)]">
        {creative.thumbnailUrl ? (
          isVideo ? (
            <video src={creative.thumbnailUrl} className="absolute inset-0 h-full w-full object-cover" muted playsInline preload="metadata" />
          ) : (
            <img src={creative.thumbnailUrl} alt={creative.name} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          )
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center border border-dashed border-[var(--color-violet)]/25 m-2 rounded-lg">
            <Sparkles size={22} className="text-[var(--color-violet)]/40 mb-2" />
            <span className="text-[11px] text-[var(--color-text-secondary)]">No asset</span>
            <span className="text-[10px] text-[var(--color-text-secondary)]/60 mt-0.5 px-4 text-center">
              Sample data — upload your own to get started
            </span>
          </div>
        )}

        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <PlayCircle size={20} className="text-white" />
            </div>
          </div>
        )}

        <div className="absolute top-2 left-2">
          <PlatformBadge platform={creative.platform} />
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <StatusBadge status={creative.status} />
          <div onClick={(e) => e.stopPropagation()}>
            <CreativeActionMenu creative={creative} onEdit={onEdit}>
              <button className="h-6 w-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white">
                <MoreVertical size={13} />
              </button>
            </CreativeActionMenu>
          </div>
        </div>
        <div className="absolute bottom-2 right-2">
          <span className="text-[10px] rounded-full bg-black/40 backdrop-blur-sm text-white px-2 py-0.5">{creative.format}</span>
        </div>

        {hover && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center gap-3 animate-slide-up">
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/creatives/${creative.id}`)
              }}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              <Eye size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(creative)
              }}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              <Sparkles size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="mono text-[11px] truncate flex-1">{creative.name}</p>
        </div>
        <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">{creative.variants.length} sizes</p>
        <div className="flex items-center justify-between mt-2">
          {hasMetrics ? (
            <>
              <span className="mono text-lg text-[var(--color-violet)] font-medium">{creative.roas.toFixed(2)}x</span>
              <div className="text-right">
                <p className="mono text-[10px] text-[var(--color-text-secondary)]">{creative.ctr.toFixed(1)}% CTR</p>
                <p className="mono text-[10px] text-[var(--color-text-secondary)]">{formatCurrency(creative.spend)}</p>
              </div>
            </>
          ) : (
            <>
              <span className="mono text-lg text-[var(--color-text-secondary)]/50 font-medium">—</span>
              <p className="text-[10px] text-[var(--color-text-secondary)]/70 text-right max-w-[110px] leading-tight">
                No metrics yet — connect a platform
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
