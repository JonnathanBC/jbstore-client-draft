import { useEffect } from 'react'
import { useFetcher, useParams } from 'react-router'
import { toast } from 'sonner'

import { AsyncSelect } from '~/components/inputs/AsyncSelect'
import { Field } from '~/components/inputs/Field'
import { DialogCrud } from '~/components/modals/DialogCrud'
import { useModalContext } from '~/components/modals/ModalContext'
import { useModalStore } from '~/store/modal.store'

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
    >
      <Field
        name="option_id"
        labelKey="global.option"
        component={AsyncSelect}
        source="/resources/options"
      />

      <Field name="value" label="Valor" />
    </DialogCrud>
  )
}
