import { useNavigate } from 'react-router-dom'
import { PlusCircle, Upload, Sparkles, FileBarChart } from 'lucide-react'

const actions = [
  { label: 'New Campaign', icon: PlusCircle, to: '/campaigns' },
  { label: 'Upload Creative', icon: Upload, to: '/creatives' },
  { label: 'Run AI Analysis', icon: Sparkles, to: '/ai-assistant' },
  { label: 'Build Report', icon: FileBarChart, to: '/reports' },
]

export function QuickActions() {
  const navigate = useNavigate()
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={() => navigate(a.to)}
          className="flex flex-col items-start gap-3 rounded-lg border border-[var(--color-border)] p-4 text-left hover:border-[var(--color-violet)] transition-base"
        >
          <a.icon size={18} className="text-[var(--color-violet)]" strokeWidth={1.75} />
          <span className="text-xs font-medium">{a.label}</span>
        </button>
      ))}
    </div>
  )
}
