import { useEffect } from 'react'
import { useFetcher, useParams } from 'react-router'
import { toast } from 'sonner'

import { DialogCrud } from '~/components/modals/DialogCrud'
import { useModalContext } from '~/components/modals/ModalContext'
import { ProductVariantForm } from './ProductVariantForm'

export default function ProductVariantModal() {
  const { id } = useParams()
  const fetcher = useFetcher()
  const ctx = useModalContext()
  const isSubmitting = fetcher.state === 'submitting'

  useEffect(() => {
    if (fetcher.data?.ok) {
      toast.success('Variante creada correctamente')
      ctx.onClose()
    }

    if (fetcher.data?.error) {
      toast.error(fetcher.data.error)
    }
  }, [fetcher.data])

  const onSubmit = (data: Record<string, unknown>) => {
    fetcher.submit(
      { ...data, _action: 'create_variant' } as Record<string, string>,
      { method: 'post', action: `/admin/products/${id}` },
    )
  }

  return (
    <DialogCrud
      title="Nueva variante"
      onSubmit={onSubmit}
      actionData={fetcher.data}
      isSubmitting={isSubmitting}
      options={{
        defaultValues: {
          features: [{ id: '', value: '', description: '' }],
        },
      }}
    >
      <ProductVariantForm />
    </DialogCrud>
  )
}
