import { ReactNode, useEffect } from 'react'
import { FieldValues } from 'react-hook-form'
import { useFetcher, useNavigate } from 'react-router'
import { toast } from 'sonner'

import { DialogCrud } from './DialogCrud'

interface ActionData {
  error?: string
  errors?: Record<string, string[]>
}

interface Props {
  title: string
  method: 'POST' | 'PATCH' | 'PUT'
  defaultValues?: FieldValues
  children: ReactNode
}

/**
 * Modal de formulario montado como ruta hija (p. ej. `admin.drivers.create`).
 * - El submit va al action de la ruta donde se renderiza (no hace falta `action`).
 * - Cerrar = navegar a la ruta padre.
 * - El action devuelve `{ error, errors }` si falla, o un redirect si sale bien:
 *   el redirect cambia la URL y eso es lo que cierra el modal.
 */
export function RouteModalForm({
  title,
  method,
  defaultValues,
  children,
}: Props) {
  const navigate = useNavigate()
  const fetcher = useFetcher<ActionData>()
  const isSubmitting = fetcher.state !== 'idle'

  useEffect(() => {
    if (fetcher.data?.error) toast.error(fetcher.data.error)
  }, [fetcher.data])

  const onSubmit = (data: FieldValues) => {
    fetcher.submit(data, { method, encType: 'application/json' })
  }

  return (
    <DialogCrud
      title={title}
      onSubmit={onSubmit}
      onClose={() => navigate('..')}
      isSubmitting={isSubmitting}
      actionData={fetcher.data}
      options={{ defaultValues }}
    >
      {children}
    </DialogCrud>
  )
}
