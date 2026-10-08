import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import { toast } from 'sonner'

import { AsyncSelect } from '~/components/inputs/AsyncSelect'
import { Field } from '~/components/inputs/Field'
import { Select } from '~/components/inputs/Select'
import { DialogCrud } from '~/components/modals/DialogCrud'
import { useModalContext } from '~/components/modals/ModalContext'
import { t } from '~/i18n'
import { Driver } from '~/types/driver'

const TYPE_ITEMS = [
  { value: 'car', label: 'Auto' },
  { value: 'motorcycle', label: 'Moto' },
]

interface Props {
  driver?: Driver
}

export default function DriverModal({ driver }: Props) {
  const fetcher = useFetcher<{
    success?: boolean
    error?: string
    errors?: Record<string, string[]>
  }>()
  const { onClose } = useModalContext()
  const isEdit = Boolean(driver)
  const isSubmitting = fetcher.state === 'submitting'

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return
    if (fetcher.data.error) toast.error(fetcher.data.error)
    if (fetcher.data.success) {
      toast.success(isEdit ? 'Actualizado con éxito' : 'Creado con éxito')
      onClose()
    }
  }, [fetcher.state, fetcher.data])

  const onSubmit = (data: Record<string, unknown>) => {
    fetcher.submit(
      {
        ...data,
        intent: isEdit ? 'update-driver' : 'create-driver',
        ...(isEdit && { id: driver!.id }),
      },
      {
        method: isEdit ? 'PATCH' : 'POST',
        action: '/admin/drivers',
        encType: 'application/json',
      },
    )
  }

  return (
    <DialogCrud
      title={isEdit ? 'Editar conductor' : 'Nuevo conductor'}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      actionData={fetcher.data}
      options={{
        defaultValues: {
          user_id: driver ? String(driver.user_id) : '',
          type: driver?.type ?? '',
          license_plate: driver?.license_plate ?? '',
        },
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Usuario"
          name="user_id"
          component={AsyncSelect}
          source="/resources/users"
          className="col-span-2"
          obb
        />
        <Field
          labelKey="global.type"
          name="type"
          component={Select}
          items={TYPE_ITEMS}
          placeholder={t('global.type')}
          obb
        />
        <Field label="Placa" name="license_plate" obb />
      </div>
    </DialogCrud>
  )
}
