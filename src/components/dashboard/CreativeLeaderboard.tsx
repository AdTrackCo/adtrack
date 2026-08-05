import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { PlatformBadge } from '@/components/common/PlatformBadge'
import { useCreatives } from '@/lib/CreativesContext'

export function CreativeLeaderboard() {
  const { creatives, isSample } = useCreatives()
  const top5 = [...creatives].sort((a, b) => b.roas - a.roas).slice(0, 5)

  if (top5.length === 0) {
    return <p className="text-xs text-[var(--color-text-secondary)]">No creatives yet.</p>
  }

  return (
    <div className="space-y-1">
      {top5.map((c, i) => (
        <Link
          key={c.id}
          to={`/creatives/${c.id}`}
          className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5 transition-base"
        >
          <span className="mono text-sm text-[var(--color-violet)] w-4 shrink-0">{i + 1}</span>
          <div className="h-9 w-9 rounded-md bg-[var(--color-elevated)] border border-[var(--color-border)] flex items-center justify-center shrink-0 overflow-hidden">
            {c.thumbnailUrl ? (
              <img src={c.thumbnailUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Sparkles size={14} className="text-[var(--color-violet)]/50" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="mono text-xs truncate">{c.name}</p>
            <PlatformBadge platform={c.platform} className="mt-1" />
          </div>
          <div className="text-right shrink-0">
            {c.roas > 0 ? (
              <>
                <p className="mono text-sm text-[var(--color-violet)] font-medium">{c.roas.toFixed(2)}x</p>
                <p className="mono text-[10px] text-[var(--color-text-secondary)]">{c.ctr.toFixed(1)}% CTR</p>
              </>
            ) : (
              <p className="mono text-sm text-[var(--color-text-secondary)]/50">—</p>
            )}
          </div>
        </Link>
      ))}
      {isSample && (
        <p className="text-[10px] text-[var(--color-text-secondary)]/70 px-2 pt-2">Sample data</p>
      )}
    </div>
  )
}
