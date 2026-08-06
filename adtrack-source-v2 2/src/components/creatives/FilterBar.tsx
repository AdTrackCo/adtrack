import { Search, LayoutGrid, List, X } from 'lucide-react'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { platforms, formats, stages, statuses } from '@/lib/mockData'
import { cn } from '@/lib/utils'

export interface Filters {
  platform: string
  format: string
  stage: string
  status: string
  sort: string
  search: string
}

export const emptyFilters: Filters = { platform: '', format: '', stage: '', status: '', sort: 'roas-desc', search: '' }

export function FilterBar({
  filters,
  setFilters,
  view,
  setView,
}: {
  filters: Filters
  setFilters: (f: Filters) => void
  view: 'grid' | 'list'
  setView: (v: 'grid' | 'list') => void
}) {
  const update = (k: keyof Filters, v: string) => setFilters({ ...filters, [k]: v })
  const activeChips = (['platform', 'format', 'stage', 'status'] as const).filter((k) => filters[k])

  return (
    <div className="px-6 md:px-8 py-4 border-b border-[var(--color-border)] space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={filters.platform} onChange={(e) => update('platform', e.target.value)} className="w-auto">
          <option value="">Platform</option>
          {platforms.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
        <Select value={filters.format} onChange={(e) => update('format', e.target.value)} className="w-auto">
          <option value="">Format</option>
          {formats.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </Select>
        <Select value={filters.stage} onChange={(e) => update('stage', e.target.value)} className="w-auto">
          <option value="">Funnel Stage</option>
          {stages.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select value={filters.status} onChange={(e) => update('status', e.target.value)} className="w-auto">
          <option value="">Status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select value={filters.sort} onChange={(e) => update('sort', e.target.value)} className="w-auto">
          <option value="roas-desc">Sort: ROAS high to low</option>
          <option value="roas-asc">Sort: ROAS low to high</option>
          <option value="spend-desc">Sort: Spend high to low</option>
          <option value="ctr-desc">Sort: CTR high to low</option>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
            <Input
              placeholder="Search creatives…"
              value={filters.search}
              onChange={(e) => update('search', e.target.value)}
              className="pl-8 w-52"
            />
          </div>
          <div className="flex items-center rounded-lg border border-[var(--color-border)] p-0.5">
            <button
              onClick={() => setView('grid')}
              className={cn('h-7 w-7 rounded-md flex items-center justify-center transition-base', view === 'grid' ? 'bg-[var(--color-violet)]/15 text-[var(--color-violet)]' : 'text-[var(--color-text-secondary)]')}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn('h-7 w-7 rounded-md flex items-center justify-center transition-base', view === 'list' ? 'bg-[var(--color-violet)]/15 text-[var(--color-violet)]' : 'text-[var(--color-text-secondary)]')}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeChips.map((k) => (
            <span key={k} className="inline-flex items-center gap-1 rounded-full bg-[var(--color-violet)]/10 text-[var(--color-violet)] text-[11px] px-2.5 py-0.5">
              {filters[k]}
              <button onClick={() => update(k, '')}>
                <X size={11} />
              </button>
            </span>
          ))}
          <Button variant="ghost" size="sm" onClick={() => setFilters(emptyFilters)}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  )
}
