import * as React from 'react'
import { cn } from '@/lib/utils'

type Tone = 'success' | 'warning' | 'danger' | 'muted' | 'violet' | 'teal'

const tones: Record<Tone, string> = {
  success: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]',
  muted: 'bg-white/5 text-[var(--color-text-secondary)]',
  violet: 'bg-[var(--color-violet)]/15 text-[var(--color-violet)]',
  teal: 'bg-[var(--color-teal)]/10 text-[var(--color-teal)]',
}

export function Badge({ tone = 'muted', className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium leading-none',
        tones[tone],
        className
      )}
      {...props}
    />
  )
}
