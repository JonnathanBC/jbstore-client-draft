import { useEffect } from 'react'
import { useFetcher, useParams } from 'react-router'
import { toast } from 'sonner'
import type { FieldValues } from 'react-hook-form'

import { DialogCrud } from '~/components/modals/DialogCrud'
import { useModalContext } from '~/components/modals/ModalContext'
import type { MutationResult } from '~/server/mutation.server'
import { OptionsProductForm } from './OptionsProductForm'

export default function OptionProductModal() {
  const { id } = useParams()
  const fetcher = useFetcher<MutationResult>()
  const { onClose } = useModalContext()
  const isSubmitting = fetcher.state !== 'idle'

  // Los errores de validación los pinta FormProvider vía `actionData`;
  // el toast de éxito llega por flash. Acá sólo el toast de error y el cierre.
  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return
    if (fetcher.data.error) toast.error(fetcher.data.error)
    if (fetcher.data.ok) onClose()
  }, [fetcher.state, fetcher.data])

  const onSubmit = (data: FieldValues) => {
    // POST /admin/products/:id/options → admin.products.$id.options
    fetcher.submit(
      { option_id: data.option_id, features: data.features },
      {
        method: 'POST',
        action: `/admin/products/${id}/options`,
        encType: 'application/json',
      },
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
