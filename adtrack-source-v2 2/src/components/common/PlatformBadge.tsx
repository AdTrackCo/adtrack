import type { Platform } from '@/types'
import { cn } from '@/lib/utils'

const platformColors: Record<Platform, string> = {
  Meta: 'bg-[#7C5CFC]/15 text-[#a996ff]',
  Google: 'bg-[#2AFFD3]/10 text-[#2AFFD3]',
  TikTok: 'bg-white/10 text-white',
  Snapchat: 'bg-[#E8A938]/10 text-[#E8A938]',
  Pinterest: 'bg-[#E8505B]/10 text-[#E8505B]',
  YouTube: 'bg-[#E8505B]/10 text-[#E8505B]',
  X: 'bg-white/10 text-white',
  Amazon: 'bg-[#E8A938]/10 text-[#E8A938]',
  Roku: 'bg-[#7C5CFC]/15 text-[#a996ff]',
}

export function PlatformBadge({ platform, className }: { platform: Platform; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium leading-none backdrop-blur-sm',
        platformColors[platform],
        className
      )}
    >
      {platform}
    </span>
  )
}
