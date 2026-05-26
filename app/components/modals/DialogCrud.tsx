import { Save, XIcon } from 'lucide-react'
import { FieldValues, SubmitHandler } from 'react-hook-form'

import { FormProvider } from '@/components/form/FormProvider'
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
  title: string
  onClose?: () => void
  onSubmit: SubmitHandler<FieldValues>
  children: React.ReactNode
}

export const DialogCrud = ({
  title,
  onClose,
  open = true,
  onSubmit,
  children,
}: Props) => {
  const ctx = useModalContext()
  const close = onClose ?? ctx?.onClose

  return (
    <FormProvider>
      {({ handleSubmit }) => (
        <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            if (!isOpen) close?.()
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent
              showCloseButton={false}
              className="p-4 sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
            >
              <DialogHeader className="mb-4 flex-row items-center justify-between gap-0">
                <DialogTitle>{title}</DialogTitle>
                <div className="flex items-center gap-4">
                  <button
                    className="btn btn-primary flex items-center gap-2"
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                  >
                    <Save className="size-4" /> Guardar
                  </button>
                  <DialogClose>
                    <XIcon className="size-4 cursor-pointer hover:text-red-800" />
                  </DialogClose>
                </div>
              </DialogHeader>
              {children}
            </DialogContent>
          </form>
        </Dialog>
      )}
    </FormProvider>
  )
}
