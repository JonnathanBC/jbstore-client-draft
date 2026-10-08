import { useEffect } from 'react'
import { useFetcher, useNavigate } from 'react-router'
import { toast } from 'sonner'

import { AsyncSelect } from '~/components/inputs/AsyncSelect'
import { Field } from '~/components/inputs/Field'
import { Select } from '~/components/inputs/Select'
import { DialogCrud } from '~/components/modals/DialogCrud'
import { t } from '~/i18n'
import { Driver } from '~/types/driver'

const TYPE_ITEMS = [
  { value: 'car', label: 'Auto' },
  { value: 'motorcycle', label: 'Moto' },
]

interface Props {
  title: string
  method: 'POST' | 'PATCH'
  driver?: Driver
}

/**
 * Modal de alta/edición de conductor. Se renderiza dentro de una ruta hija
 * (create / $id), así que el submit va al action de ESA ruta y cerrar
 * es volver a la ruta padre.
 */
export function DriverFormModal({ title, method, driver }: Props) {
  const navigate = useNavigate()
  const fetcher = useFetcher<{
    error?: string
    errors?: Record<string, string[]>
  }>()
  const isSubmitting = fetcher.state !== 'idle'

  useEffect(() => {
    if (fetcher.data?.error) toast.error(fetcher.data.error)
  }, [fetcher.data])

  const onSubmit = (data: Record<string, unknown>) => {
    fetcher.submit(data as Record<string, string>, {
      method,
      encType: 'application/json',
    })
  }

  return (
    <DialogCrud
      title={title}
      onSubmit={onSubmit}
      onClose={() => navigate('..')}
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
