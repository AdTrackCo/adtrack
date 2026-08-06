import type { ReactNode } from 'react'

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-[var(--color-border)]">
      <div>
        <h1 className="text-xl font-light tracking-tight text-[var(--color-text-primary)]">{title}</h1>
        {description && <p className="text-sm text-[var(--color-text-secondary)] mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
