import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { useConfirmStore } from './confirm.store'

export function ConfirmDialogHost() {
  const options = useConfirmStore((s) => s.options)
  const settle = useConfirmStore((s) => s.settle)

  return (
    <Dialog
      open={!!options}
      onOpenChange={(open) => {
        if (!open) settle(false)
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{options?.title}</DialogTitle>
          <DialogDescription>{options?.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => settle(false)}>
            {options?.cancelText}
          </Button>
          <Button variant="destructive" onClick={() => settle(true)}>
            {options?.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
