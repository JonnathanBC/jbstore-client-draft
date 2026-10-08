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

interface ActionData {
  errors?: Record<string, string[]>
}

interface Props {
  open?: boolean
  title: string
  onClose: () => void
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
  return (
    <FormProvider actionData={actionData} options={options}>
      {(methods) => (
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
            {/* El <form> va DENTRO del DialogContent: el contenido se renderiza en un
                portal, así que un <form> afuera no envolvería a los inputs (Enter no enviaría). */}
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <DialogHeader className="mb-4 flex-row items-center justify-between gap-0">
                <DialogTitle>{title}</DialogTitle>
                <div className="flex items-center gap-4">
                  <button
                    className="btn btn-primary flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    <Save className="size-4" />
                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                  </button>
                  <DialogClose
                    type="button"
                    className="cursor-pointer hover:text-red-800"
                  >
                    <XIcon className="size-4" />
                  </DialogClose>
                </div>
              </DialogHeader>
              {typeof children === 'function' ? children(methods) : children}
            </form>
          </DialogContent>
        </Dialog>
      )}
    </FormProvider>
  )
}
