import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { FilterBar, emptyFilters, type Filters } from '@/components/creatives/FilterBar'
import { CreativeCard } from '@/components/creatives/CreativeCard'
import { CreativeActionMenu } from '@/components/creatives/CreativeActionMenu'
import { UploadDrawer } from '@/components/creatives/UploadDrawer'
import { PlatformBadge } from '@/components/common/PlatformBadge'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatCurrency } from '@/lib/utils'
import { MoreVertical, AlertTriangle, Loader2 } from 'lucide-react'
import { useCreatives } from '@/lib/CreativesContext'
import type { CreativeSet } from '@/types'

export function CreativeLibrary() {
  const navigate = useNavigate()
  const { creatives: allCreatives, isSample, loading, setupError, error } = useCreatives()
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [uploadOpen, setUploadOpen] = useState(false)

  const filtered = useMemo(() => {
    let list = allCreatives.filter((c) => {
      if (filters.platform && c.platform !== filters.platform) return false
      if (filters.format && c.format !== filters.format) return false
      if (filters.stage && c.funnelStage !== filters.stage) return false
      if (filters.status && c.status !== filters.status) return false
      if (filters.search && !c.name.toLowerCase().includes(filters.search.toLowerCase()) && !c.hookText.toLowerCase().includes(filters.search.toLowerCase()))
        return false
      return true
    })
    const [key, dir] = filters.sort.split('-')
    list = [...list].sort((a, b) => {
      const av = (a as any)[key === 'spend' ? 'spend' : key]
      const bv = (b as any)[key === 'spend' ? 'spend' : key]
      return dir === 'asc' ? av - bv : bv - av
    })
    return list
  }, [filters, allCreatives])

  return (
    <div>
      <PageHeader
        title="Creative Library"
        description={loading ? 'Loading…' : `${filtered.length} creative set${filtered.length === 1 ? '' : 's'}`}
        actions={
          <Button variant="primary" onClick={() => setUploadOpen(true)}>
            <Upload size={14} /> Upload Creative
          </Button>
        }
      />

      {setupError && (
        <div className="mx-6 md:mx-8 mt-6 rounded-lg border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/5 px-4 py-3">
          <p className="text-xs font-medium flex items-center gap-2 text-[var(--color-danger)]">
            <AlertTriangle size={13} /> Database not set up yet
          </p>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-1.5">{setupError}</p>
        </div>
      )}

      {error && !setupError && (
        <div className="mx-6 md:mx-8 mt-6 rounded-lg border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/5 px-4 py-3">
          <p className="text-[11px] text-[var(--color-danger)]">{error}</p>
        </div>
      )}

      {isSample && !loading && (
        <div className="mx-6 md:mx-8 mt-6 rounded-lg border border-[var(--color-violet)]/40 bg-[var(--color-violet)]/5 px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-xs">
            Showing sample creatives. Upload your first creative and these disappear permanently.
          </p>
          <Button variant="primary" size="sm" onClick={() => setUploadOpen(true)}>
            Upload Creative
          </Button>
        </div>
      )}

      <FilterBar filters={filters} setFilters={setFilters} view={view} setView={setView} />

      {loading && (
        <div className="flex items-center justify-center py-20 text-[var(--color-text-secondary)] text-sm gap-2">
          <Loader2 size={16} className="animate-spin" /> Loading your creatives…
        </div>
      )}

      <div className={`p-6 md:p-8 ${loading ? 'hidden' : ''}`}>
        {view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map((c) => (
              <CreativeCard key={c.id} creative={c} onEdit={() => setUploadOpen(true)} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Platform</th>
                  <th className="px-4 py-3 font-medium">Format</th>
                  <th className="px-4 py-3 font-medium">Stage</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">ROAS</th>
                  <th className="px-4 py-3 font-medium text-right">CTR</th>
                  <th className="px-4 py-3 font-medium text-right">Spend</th>
                  <th className="px-4 py-3 font-medium text-right">Sizes</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/creatives/${c.id}`)}
                    className="border-b border-[var(--color-border)] last:border-0 cursor-pointer hover:bg-white/[0.03] transition-base"
                    style={{ background: i % 2 === 1 ? 'rgba(255,255,255,0.02)' : undefined }}
                  >
                    <td className="px-4 py-3 mono text-xs">{c.name}</td>
                    <td className="px-4 py-3">
                      <PlatformBadge platform={c.platform} />
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">{c.format}</td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">{c.funnelStage}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 mono text-xs text-[var(--color-violet)] text-right">{c.roas.toFixed(2)}x</td>
                    <td className="px-4 py-3 mono text-xs text-right">{c.ctr.toFixed(1)}%</td>
                    <td className="px-4 py-3 mono text-xs text-right">{formatCurrency(c.spend)}</td>
                    <td className="px-4 py-3 text-xs text-right">{c.variants.length}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <CreativeActionMenu creative={c as CreativeSet} onEdit={() => setUploadOpen(true)}>
                        <button className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                          <MoreVertical size={14} />
                        </button>
                      </CreativeActionMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UploadDrawer open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  )
}
