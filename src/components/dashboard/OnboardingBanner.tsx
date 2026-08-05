import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useOnboarding } from '@/lib/OnboardingContext'

export function OnboardingBanner() {
  const { connectedPlatform, bannerDismissed, dismissBanner } = useOnboarding()

  if (connectedPlatform || bannerDismissed) return null

  return (
    <div className="mx-6 md:mx-8 mt-6 rounded-lg border border-[var(--color-violet)]/40 bg-[var(--color-violet)]/5 px-4 py-3 flex items-center justify-between gap-4">
      <p className="text-xs text-[var(--color-text-primary)]">
        You're viewing sample data — connect your first ad platform to see your real performance.
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <Link to="/settings">
          <Button variant="primary" size="sm">
            Connect Platform
          </Button>
        </Link>
        <button onClick={dismissBanner} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
