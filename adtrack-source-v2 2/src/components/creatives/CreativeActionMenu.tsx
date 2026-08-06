import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Eye, Pencil, Copy, RefreshCw, Trash2, ChevronRight } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/DropdownMenu'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { deleteCreativeSet, duplicateCreativeSet, updateCreativeStatus } from '@/lib/creativesService'
import { useCreatives } from '@/lib/CreativesContext'
import type { CreativeSet, CreativeStatus } from '@/types'

const allStatuses: CreativeStatus[] = ['Draft', 'In Review', 'Live', 'Paused', 'Testing', 'Rejected', 'Archived']

export function CreativeActionMenu({
  creative,
  onEdit,
  children,
}: {
  creative: CreativeSet
  onEdit: (c: CreativeSet) => void
  children: ReactNode
}) {
  const navigate = useNavigate()
  const { isSample, refresh } = useCreatives()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  // Sample rows don't exist in the database, so writes would fail confusingly.
  function guardSample(): boolean {
    if (isSample) {
      toast.error('This is sample data. Upload your own creative to manage it.')
      return true
    }
    return false
  }

  async function handleDuplicate() {
    if (guardSample()) return
    try {
      await duplicateCreativeSet(creative.id)
      await refresh()
      toast.success('Creative duplicated ✓')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not duplicate.')
    }
  }

  async function handleStatus(status: CreativeStatus) {
    if (guardSample()) return
    try {
      await updateCreativeStatus(creative.id, status)
      await refresh()
      toast.success(`Status changed to ${status} ✓`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update status.')
    }
  }

  async function handleDelete() {
    if (guardSample()) {
      setConfirmOpen(false)
      return
    }
    setBusy(true)
    try {
      await deleteCreativeSet(creative.id)
      await refresh()
      toast.success('Creative deleted ✓')
      setConfirmOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => navigate(`/creatives/${creative.id}`)}>
            <Eye size={14} /> View Details
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onEdit(creative)}>
            <Pencil size={14} /> Edit Creative
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void handleDuplicate()}>
            <Copy size={14} /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span className="flex items-center gap-2">
                <RefreshCw size={14} /> Change Status
              </span>
              <ChevronRight size={14} />
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {allStatuses.map((s) => (
                <DropdownMenuItem key={s} onSelect={() => void handleStatus(s)}>
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-[var(--color-danger)]" onSelect={() => setConfirmOpen(true)}>
            <Trash2 size={14} /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal open={confirmOpen} onOpenChange={setConfirmOpen} title="Delete this creative?">
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          This permanently removes <span className="mono text-[var(--color-text-primary)]">{creative.name}</span> and all its size variants. This can't be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => void handleDelete()} disabled={busy}>
            {busy ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </>
  )
}
