import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Megaphone,
  Image,
  BarChart2,
  Users,
  FlaskConical,
  Sparkles,
  DollarSign,
  FileText,
  ShieldCheck,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { to: '/creatives', label: 'Creative Library', icon: Image },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/audiences', label: 'Audiences', icon: Users },
  { to: '/testing-lab', label: 'Testing Lab', icon: FlaskConical },
  { to: '/ai-assistant', label: 'AI Assistant', icon: Sparkles },
  { to: '/budget', label: 'Budget & Financials', icon: DollarSign },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/compliance', label: 'Compliance', icon: ShieldCheck },
  { to: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
]

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen sticky top-0 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg)] transition-base',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="h-14 flex items-center px-4 border-b border-[var(--color-border)] shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-[var(--color-violet)] text-lg leading-none shrink-0">◆</span>
          {!collapsed && (
            <span className="text-[15px] font-medium whitespace-nowrap">
              <span className="text-[var(--color-violet)]">A</span>dTrack
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-base',
                isActive
                  ? 'bg-[var(--color-violet)]/10 text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-r bg-[var(--color-violet)]" />
                )}
                <item.icon size={17} strokeWidth={1.75} className="shrink-0" />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-2 py-2 border-t border-[var(--color-border)]">
        <NavLink
          to="/settings"
          title={collapsed ? 'Settings' : undefined}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-base',
              isActive
                ? 'bg-[var(--color-violet)]/10 text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]'
            )
          }
        >
          <Settings size={17} strokeWidth={1.75} className="shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        <button
          onClick={onToggle}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)] transition-base"
        >
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
