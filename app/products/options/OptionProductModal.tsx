import { useEffect, useRef } from 'react'
import { useFetcher, useParams } from 'react-router'
import { toast } from 'sonner'
import { UseFormReturn } from 'react-hook-form'

import { DialogCrud } from '~/components/modals/DialogCrud'
import { useModalContext } from '~/components/modals/ModalContext'
import { OptionsProductForm } from '../options/OptionsProductForm'

export default function OptionProductModal() {
  const { id } = useParams()
  const fetcher = useFetcher()
  const ctx = useModalContext()
  const isSubmitting = fetcher.state === 'submitting'
  const formRef = useRef<UseFormReturn | null>(null)

  useEffect(() => {
    if (!fetcher.data || !formRef.current) return

    if (fetcher.data.ok) {
      toast.success('Variante creada correctamente')
      ctx.onClose()
      return
    }

    if (fetcher.data.errors) {
      formRef.current.clearErrors()
      Object.entries(fetcher.data.errors as Record<string, string[]>).forEach(
        ([field, messages]) => {
          formRef.current!.setError(field, { message: messages[0] })
        },
      )
    }

    if (fetcher.data.error) {
      toast.error(fetcher.data.error)
    }
  }, [fetcher.data])

  const onSubmit = (data: Record<string, unknown>) => {
    fetcher.submit(
      {
        ...data,
        features: JSON.stringify(data.features),
        _action: 'create-option-product',
      } as Record<string, string>,
      { method: 'post', action: `/admin/products/${id}` },
    )
  }

  return (
    <DialogCrud
      title="Nueva variante"
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      options={{
        defaultValues: {
          features: [{ id: '', value: '', description: '' }],
        },
      }}
    >
      {(methods) => {
        formRef.current = methods
        return <OptionsProductForm />
      }}
    </DialogCrud>
  )
}
