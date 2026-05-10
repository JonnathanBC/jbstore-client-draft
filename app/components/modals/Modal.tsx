import type { ReactNode } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useModalContext } from './ModalContext'
import { XIcon } from 'lucide-react'
import { cn } from '~/lib/utils'

interface Props {
  open?: boolean
  onClose?: () => void
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
  const ctx = useModalContext()
  const close = onClose ?? ctx?.onClose

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) close?.()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="p-4 sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
      >
        <DialogHeader className="mb-4 flex-row items-center justify-between gap-0">
          <DialogTitle>{title}</DialogTitle>
          <div className={cn('flex items-center', actionButtons && 'gap-4')}>
            {actionButtons && actionButtons}
            <DialogClose>
              <button className="cursor-pointer hover:text-red-800">
                <XIcon className="size-4" />
              </button>
            </DialogClose>
          </div>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
