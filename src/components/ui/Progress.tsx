import { cn } from '@/lib/utils'

export function Progress({ value, className, barClassName }: { value: number; className?: string; barClassName?: string }) {
  return (
    <div className={cn('h-1.5 w-full rounded-full bg-white/5 overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full bg-[var(--color-violet)] transition-base', barClassName)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
