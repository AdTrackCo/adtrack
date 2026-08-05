import { Badge } from '@/components/ui/Badge'
import type { CreativeStatus } from '@/types'

const toneMap: Record<CreativeStatus, 'success' | 'warning' | 'muted' | 'danger' | 'violet'> = {
  Live: 'success',
  Paused: 'warning',
  Draft: 'muted',
  Rejected: 'danger',
  'In Review': 'violet',
  Archived: 'muted',
  Testing: 'violet',
}

export function StatusBadge({ status }: { status: CreativeStatus }) {
  return <Badge tone={toneMap[status]}>{status}</Badge>
}
