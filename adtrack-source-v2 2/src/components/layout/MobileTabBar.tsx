import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Image, BarChart2, Sparkles, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/creatives', label: 'Creatives', icon: Image },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/ai-assistant', label: 'AI', icon: Sparkles },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function MobileTabBar() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--color-surface)] border-t border-[var(--color-border)] flex items-center justify-around z-30">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center gap-1 text-[10px] w-full h-full',
              isActive ? 'text-[var(--color-violet)]' : 'text-[var(--color-text-secondary)]'
            )
          }
        >
          <tab.icon size={19} strokeWidth={1.75} />
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
