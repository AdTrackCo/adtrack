import { Info, AlertTriangle } from 'lucide-react'

/**
 * A persistent, non-dismissible notice that the data on screen is sample data,
 * not the user's real account data.
 *
 * Use `tone="warning"` for screens where mistaking sample data for real data
 * could cause the user to act on it (financial figures, compliance flags).
 *
 * As each module gets wired to real data, delete its banner.
 */
export function SampleDataBanner({
  children,
  tone = 'info',
}: {
  children: React.ReactNode
  tone?: 'info' | 'warning'
}) {
  const warning = tone === 'warning'
  const Icon = warning ? AlertTriangle : Info

  return (
    <div
      className={`mx-6 md:mx-8 mt-6 rounded-lg border px-4 py-3 flex items-start gap-2.5 ${
        warning
          ? 'border-[var(--color-warning)]/40 bg-[var(--color-warning)]/5'
          : 'border-[var(--color-violet)]/30 bg-[var(--color-violet)]/5'
      }`}
    >
      <Icon
        size={14}
        className={`shrink-0 mt-0.5 ${warning ? 'text-[var(--color-warning)]' : 'text-[var(--color-violet)]'}`}
      />
      <div className="min-w-0">
        <p className="text-xs font-medium">
          {warning ? 'Sample data — do not act on these numbers' : 'Sample data'}
        </p>
        <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed mt-0.5">{children}</p>
      </div>
    </div>
  )
}
