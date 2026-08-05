import * as RDropdown from '@radix-ui/react-dropdown-menu'
import * as React from 'react'
import { cn } from '@/lib/utils'

export const DropdownMenu = RDropdown.Root
export const DropdownMenuTrigger = RDropdown.Trigger
export const DropdownMenuSub = RDropdown.Sub
export const DropdownMenuSubTrigger = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof RDropdown.SubTrigger>>(
  ({ className, ...props }, ref) => (
    <RDropdown.SubTrigger
      ref={ref}
      className={cn('flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-white/5 outline-none', className)}
      {...props}
    />
  )
)
export const DropdownMenuSubContent = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof RDropdown.SubContent>>(
  ({ className, ...props }, ref) => (
    <RDropdown.Portal>
      <RDropdown.SubContent
        ref={ref}
        className={cn('min-w-[180px] rounded-lg border border-[var(--color-border)] bg-[var(--color-elevated)] p-1 shadow-xl z-50', className)}
        {...props}
      />
    </RDropdown.Portal>
  )
)

export function DropdownMenuContent({ className, children, ...props }: React.ComponentProps<typeof RDropdown.Content>) {
  return (
    <RDropdown.Portal>
      <RDropdown.Content
        sideOffset={6}
        align="end"
        className={cn(
          'min-w-[180px] rounded-lg border border-[var(--color-border)] bg-[var(--color-elevated)] p-1 shadow-xl z-50 data-[state=open]:animate-[fadeIn_150ms_ease]',
          className
        )}
        {...props}
      >
        {children}
      </RDropdown.Content>
    </RDropdown.Portal>
  )
}

export function DropdownMenuItem({ className, ...props }: React.ComponentProps<typeof RDropdown.Item>) {
  return (
    <RDropdown.Item
      className={cn(
        'flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer text-[var(--color-text-primary)] hover:bg-white/5 outline-none transition-base',
        className
      )}
      {...props}
    />
  )
}

export function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof RDropdown.Separator>) {
  return <RDropdown.Separator className={cn('h-px bg-[var(--color-border)] my-1', className)} {...props} />
}
