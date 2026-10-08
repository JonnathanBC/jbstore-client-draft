import { useEffect } from 'react'
import { useFetcher, useParams } from 'react-router'
import { toast } from 'sonner'
import { FieldValues } from 'react-hook-form'

import { DialogCrud } from '~/components/modals/DialogCrud'
import { useModalContext } from '~/components/modals/ModalContext'
import { OptionsProductForm } from '../options/OptionsProductForm'

interface ActionData {
  ok?: boolean
  error?: string
  errors?: Record<string, string[]>
}

export default function OptionProductModal() {
  const { id } = useParams()
  const fetcher = useFetcher<ActionData>()
  const { onClose } = useModalContext()
  const isSubmitting = fetcher.state !== 'idle'

  // Los errores de validación los pinta FormProvider vía `actionData`;
  // acá sólo resolvemos el toast y el cierre.
  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return
    if (fetcher.data.error) toast.error(fetcher.data.error)
    if (fetcher.data.ok) {
      toast.success('Variante creada correctamente')
      onClose()
    }
  }, [fetcher.state, fetcher.data])

  const onSubmit = (data: FieldValues) => {
    fetcher.submit(
      {
        ...data,
        features: JSON.stringify(data.features),
        _action: 'create-option-product',
      },
      { method: 'post', action: `/admin/products/${id}` },
    )
  }

  return (
    <DialogCrud
      title="Nueva variante"
      onSubmit={onSubmit}
      onClose={onClose}
      isSubmitting={isSubmitting}
      actionData={fetcher.data}
      options={{
        defaultValues: {
          features: [{ id: '', value: '', description: '' }],
        },
      }}
    >
      <OptionsProductForm />
    </DialogCrud>
  )
}
