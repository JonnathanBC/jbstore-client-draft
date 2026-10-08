import type { ReactNode } from 'react'
import { XIcon } from 'lucide-react'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '~/lib/utils'

interface Props {
  open?: boolean
  onClose: () => void
  title: string
  children: ReactNode
  actionButtons?: ReactNode
}

export function Modal({
  actionButtons,
  title,
  children,
  open = true,
  onClose,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="p-4 sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
      >
        <DialogHeader className="mb-4 flex-row items-center justify-between gap-0">
          <DialogTitle>{title}</DialogTitle>
          <div className={cn('flex items-center', actionButtons && 'gap-4')}>
            {actionButtons}
            <DialogClose className="cursor-pointer hover:text-red-800">
              <XIcon className="size-4" />
            </DialogClose>
          </div>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
