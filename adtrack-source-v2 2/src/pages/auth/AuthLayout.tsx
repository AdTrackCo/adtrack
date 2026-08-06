import type { ReactNode } from 'react'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4 relative overflow-hidden">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[520px] w-[520px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(124,92,252,0.16) 0%, rgba(124,92,252,0) 70%)' }}
      />
      <div className="relative w-full max-w-[400px]">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-[var(--color-violet)] text-2xl leading-none">◆</span>
          <span className="text-2xl font-light">
            <span className="text-[var(--color-violet)] font-medium">A</span>dTrack
          </span>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
