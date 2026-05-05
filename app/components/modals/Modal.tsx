import type { ReactNode } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useModalContext } from './ModalContext'

interface Props {
  open?: boolean
  onClose?: () => void
  title: string
  children: ReactNode
}

export function Modal({ title, children, open = true, onClose }: Props) {
  const ctx = useModalContext()
  const close = onClose ?? ctx?.onClose

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) close?.() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogClose />
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
