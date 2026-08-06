import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  widthClassName?: string
}

export function Drawer({ open, onOpenChange, title, children, footer, widthClassName = 'w-full sm:w-[680px]' }: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 data-[state=open]:animate-[fadeIn_180ms_ease]" />
        <Dialog.Content
          className={cn(
            'fixed right-0 top-0 h-full bg-[var(--color-surface)] border-l border-[var(--color-border)] z-50 flex flex-col shadow-2xl',
            'data-[state=open]:animate-[slideIn_220ms_ease] outline-none',
            widthClassName
          )}
        >
          <div className="flex items-center justify-between px-6 h-14 border-b border-[var(--color-border)] shrink-0">
            <Dialog.Title className="text-sm font-medium">{title}</Dialog.Title>
            <Dialog.Close className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-base">
              <X size={18} />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
          {footer && <div className="border-t border-[var(--color-border)] px-6 py-4 flex justify-end gap-2 shrink-0">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
