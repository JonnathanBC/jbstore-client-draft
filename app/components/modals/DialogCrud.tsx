import { ReactNode } from 'react'
import {
  FieldValues,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
} from 'react-hook-form'
import { Save, XIcon } from 'lucide-react'

import { FormProvider } from '@/components/form/FormProvider'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useModalContext } from './ModalContext'

interface ActionData {
  errors?: Record<string, string[]>
}

interface Props {
  open?: boolean
  title: string
  onClose?: () => void
  onSubmit: SubmitHandler<FieldValues>
  actionData?: ActionData | null
  isSubmitting?: boolean
  options?: UseFormProps<FieldValues>
  children:
    | ReactNode
    | ((methods: UseFormReturn<FieldValues>) => React.ReactNode)
}

export const DialogCrud = ({
  title,
  onClose,
  open = true,
  onSubmit,
  actionData,
  isSubmitting = false,
  children,
  options,
}: Props) => {
  const ctx = useModalContext()
  const close = onClose ?? ctx?.onClose

  return (
    <FormProvider actionData={actionData} options={options}>
      {(methods) => (
        <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            if (!isOpen) close?.()
          }}
        >
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <DialogContent
              showCloseButton={false}
              className="p-4 sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
            >
              <DialogHeader className="mb-4 flex-row items-center justify-between gap-0">
                <DialogTitle>{title}</DialogTitle>
                <div className="flex items-center gap-4">
                  <button
                    className="btn btn-primary flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    disabled={isSubmitting}
                    onClick={methods.handleSubmit(onSubmit)}
                  >
                    <Save className="size-4" />
                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                  </button>
                  <DialogClose>
                    <XIcon className="size-4 cursor-pointer hover:text-red-800" />
                  </DialogClose>
                </div>
              </DialogHeader>
              {typeof children === 'function' ? children(methods) : children}
            </DialogContent>
          </form>
        </Dialog>
      )}
    </FormProvider>
  )
}
