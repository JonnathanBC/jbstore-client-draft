import { JSX } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Props {
  open: boolean
  setOpen: (isOpen: boolean) => void

  title: string
  children: JSX.Element
}

export function Modal({ title, children, open, setOpen }: Props) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => setOpen(!isOpen)}>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
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
